import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Feed from '../Feed';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

import {
  Container,
  Banner,
  Avatar,
  ProfileData,
  LocationIcon,
  CakeIcon,
  Followage,
  EditButton,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalCloseButton,
  ModalSaveButton,
  ModalBody,
  AvatarUploadContainer,
  BannerPlaceholder,
  AvatarUploadButton,
  CameraIcon,
  InputGroup,
  AvatarModalOverlay,
  AvatarModalContent,
  AvatarModalCloseButton,
  AvatarModalImage,
} from './styles';

interface IProfileUser {
  id?: number;
  username: string;
  first_name?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
  profile?: {
    bio?: string;
    location?: string;
    birth_date?: string;
    avatar?: string | null;
  };
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const { user: authUser, updateUser } = useAuth();

  const [externalUser, setExternalUser] = useState<IProfileUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const isMyProfile = !username || username === authUser?.username;
  const displayUser = isMyProfile ? authUser : externalUser;

  const [isEditing, setIsEditing] = useState(false);
  const [isViewingAvatar, setIsViewingAvatar] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http')
      ? imagePath
      : `http://localhost:8000${imagePath}`;
  };

  useEffect(() => {
    async function loadExternalProfile() {
      if (isMyProfile) return;

      setLoadingProfile(true);
      try {
        const response = await api.get(`/users/${username}/`);
        setExternalUser(response.data);
        setIsFollowing(response.data.is_following || false);
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário', error);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadExternalProfile();
  }, [username, isMyProfile]);

  const handleOpenEditModal = () => {
    if (authUser) {
      setFirstName(authUser.first_name || '');
      setBio(authUser.profile?.bio || '');
      setLocation(authUser.profile?.location || '');
      setBirthDate(authUser.profile?.birth_date || '');
      setAvatarPreview(getImageUrl(authUser.profile?.avatar));
    }
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('bio', bio);
      formData.append('location', location);

      if (birthDate) {
        formData.append('birth_date', birthDate);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await api.patch('/me/', formData);

      updateUser({
        ...response.data,
        followers_count:
          authUser?.followers_count ?? response.data.followers_count,
        following_count:
          authUser?.following_count ?? response.data.following_count,
      });

      setAvatarFile(null);
      setIsEditing(false);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: unknown } };
      console.error(
        'Erro ao atualizar perfil:',
        errorObj.response?.data || err
      );
      alert('Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!externalUser) return;
    try {
      await api.post(`/users/${externalUser.username}/follow/`);
      setIsFollowing(!isFollowing);

      setExternalUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          followers_count: isFollowing
            ? (prev.followers_count || 0) - 1
            : (prev.followers_count || 0) + 1,
          is_following: !isFollowing,
        };
      });
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
    }
  };

  const formattedBirthDate = displayUser?.profile?.birth_date
    ? new Date(displayUser.profile.birth_date).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Não informada';

  if (loadingProfile) {
    return (
      <Container style={{ color: 'white', padding: '20px' }}>
        Carregando perfil...
      </Container>
    );
  }

  const avatarDisplayUrl = getImageUrl(displayUser?.profile?.avatar);

  return (
    <Container>
      <Banner>
        <Avatar
          onClick={() =>
            displayUser?.profile?.avatar && setIsViewingAvatar(true)
          }
          style={
            avatarDisplayUrl
              ? {
                  backgroundImage: `url(${avatarDisplayUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                }
              : undefined
          }
        />
      </Banner>

      <ProfileData>
        {isMyProfile ? (
          <EditButton $outlined onClick={handleOpenEditModal}>
            Editar perfil
          </EditButton>
        ) : (
          <EditButton $outlined={!isFollowing} onClick={handleToggleFollow}>
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </EditButton>
        )}

        <h1>{displayUser?.first_name || displayUser?.username || 'Usuário'}</h1>
        <h2>@{displayUser?.username || 'usuario'}</h2>

        <p>{displayUser?.profile?.bio || 'Sem biografia no momento.'}</p>

        <ul>
          <li>
            <LocationIcon />
            {displayUser?.profile?.location || 'Localização não informada'}
          </li>
          <li>
            <CakeIcon />
            Nascido(a) em {formattedBirthDate}
          </li>
        </ul>

        <Followage>
          {/* CORRIGIDO AQUI: Número primeiro, texto depois */}
          <span>
            <strong>{displayUser?.following_count ?? 0}</strong> Seguindo
          </span>
          <span>
            <strong>{displayUser?.followers_count ?? 0}</strong> Seguidores
          </span>
        </Followage>
      </ProfileData>

      {isViewingAvatar && avatarDisplayUrl && (
        <AvatarModalOverlay onClick={() => setIsViewingAvatar(false)}>
          <AvatarModalContent onClick={(e) => e.stopPropagation()}>
            <AvatarModalCloseButton onClick={() => setIsViewingAvatar(false)}>
              ✕
            </AvatarModalCloseButton>
            <AvatarModalImage
              src={avatarDisplayUrl}
              alt="Foto de perfil ampliada"
            />
          </AvatarModalContent>
        </AvatarModalOverlay>
      )}

      {isEditing && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <div className="header-left">
                <ModalCloseButton
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  ✕
                </ModalCloseButton>
                <h2>Editar perfil</h2>
              </div>
              <ModalSaveButton
                type="submit"
                form="edit-profile-form"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </ModalSaveButton>
            </ModalHeader>

            <ModalBody
              as="form"
              id="edit-profile-form"
              onSubmit={handleSaveProfile}
            >
              <AvatarUploadContainer>
                <BannerPlaceholder />
                <AvatarUploadButton
                  onClick={() => fileInputRef.current?.click()}
                  style={
                    avatarPreview
                      ? {
                          backgroundImage: `url(${avatarPreview})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : undefined
                  }
                >
                  <div className="camera-wrapper">
                    <CameraIcon />
                  </div>
                </AvatarUploadButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </AvatarUploadContainer>

              <InputGroup>
                <label>Nome</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </InputGroup>

              <InputGroup>
                <label>Biografia</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </InputGroup>

              <InputGroup>
                <label>Localização</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </InputGroup>

              <InputGroup>
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </InputGroup>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      <Feed username={displayUser?.username} />
    </Container>
  );
};

export default ProfilePage;
