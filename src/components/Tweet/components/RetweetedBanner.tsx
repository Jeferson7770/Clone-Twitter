import { Icon, Retweeted } from '../styles';

/** Linha "Você retweetou" no topo do tweet. */
const RetweetedBanner = () => (
  <Retweeted>
    <Icon />
    Você retweetou
  </Retweeted>
);

export default RetweetedBanner;
