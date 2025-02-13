import { IconType } from 'react-icons'
import {
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaSoundcloud,
  FaSpotify,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa'

export type EmbedType =
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'spotify'
  | 'soundcloud'
  | 'twitch'

interface EmbedMetadataProps {
  name: 'embed'
  title: 'Embed'
  icon: IconType
  embedTypeList: {
    value: EmbedType
    title: string
    icon: IconType
  }[]
}

const EmbedMetadata: EmbedMetadataProps = {
  name: 'embed',
  title: 'Embed',
  icon: FaGlobe,
  embedTypeList: [
    { value: 'youtube', title: 'Youtube', icon: FaYoutube },
    { value: 'twitter', title: 'Twitter', icon: FaTwitter },
    { value: 'linkedin', title: 'Linkedin', icon: FaLinkedin },
    { value: 'instagram', title: 'Instagram', icon: FaInstagram },
    { value: 'facebook', title: 'Facebook', icon: FaFacebook },
    { value: 'spotify', title: 'Spotify', icon: FaSpotify },
    { value: 'soundcloud', title: 'SoundCloud', icon: FaSoundcloud },
    { value: 'twitch', title: 'Twitch', icon: FaTwitch },
  ],
}

export default EmbedMetadata
