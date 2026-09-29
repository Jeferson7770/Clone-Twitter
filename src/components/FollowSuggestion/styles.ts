import styled from 'styled-components';
import Button from '../Button';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > div {
    display: flex;
    align-items: center;
  }
`;

export const Avatar = styled.div`
  width: 49px;
  height: 49px;
  background: var(--gray);
  border-radius: 50%;
  margin-right: 10px;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;

  > strong {
    font-size: 14px;
  }

  > span {
    font-size: 14px;
    color: var(--gray);
  }
`;

interface FollowButtonProps {
  $outlined?: boolean;
}

export const FollowButton = styled(Button)<FollowButtonProps>`
  padding: 6px 17px;

  background: ${(props) =>
    props.$outlined ? 'transparent' : 'var(--twitter)'};
  color: ${(props) => (props.$outlined ? 'var(--white)' : 'var(--white)')};
  border: ${(props) => (props.$outlined ? '1px solid var(--twitter)' : 'none')};
`;
