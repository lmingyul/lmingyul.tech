import { PreviewProps } from 'sanity'
import EmbedMetadata, { EmbedType } from '../objects/Embed.metadata'
import {
  FacebookEmbed,
  InstagramEmbed,
  TwitterEmbed,
  YouTubeEmbed,
} from 'react-social-media-embed'
import SpotifyPreview from './SpotifyPreview'

// 定义扩展的 Props 类型
interface EmbedPreviewProps extends PreviewProps {
  embedType?: EmbedType;
  showPreview?: boolean;
}

const EmbedPreview = (props: EmbedPreviewProps) => {
  const embedType = EmbedMetadata.embedTypeList.find(
      (type) => type.value === props.embedType
  )
  const url = props.title as string
  const showPreview = props.showPreview

  if (!url) return props.renderDefault(props)

  const AnchorTitle = (
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
  )

  const title = embedType?.title || 'Embed Url'
  const icon = embedType?.icon || EmbedMetadata.icon
  let Preview

  switch (props.embedType) {
    case 'twitter':
      Preview = <TwitterEmbed url={url} />
      break
    case 'youtube':
      Preview = (
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
          >
            <YouTubeEmbed url={url} width={'100%'} />
          </div>
      )
      break
    case 'instagram':
      Preview = <InstagramEmbed url={url} />
      break
    case 'facebook':
      Preview = <FacebookEmbed url={url} />
      break
    case 'spotify':
      Preview = <SpotifyPreview url={url} showPreview={showPreview} />
      break
    default:
      Preview = <iframe src={url} width="100%" height="400" />
  }

  return (
      <>
        {props.renderDefault({
          ...props,
          title: <p className="text-lg">{title}</p>,
          media: icon({ size: 25 }),
        })}

        {props.renderDefault({
          ...props,
          title: AnchorTitle,
          media: '',
          actions: null,
        })}
        {showPreview && Preview}
      </>
  )
}

export default EmbedPreview