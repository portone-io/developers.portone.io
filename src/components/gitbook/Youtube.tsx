interface Props {
  videoId: string;
  caption?: string;
}

export default function YouTube(props: Props) {
  return (
    <div class="my-4">
      <iframe
        class="aspect-video w-full border-none"
        allowfullscreen
        src={`https://www.youtube.com/embed/${props.videoId}`}
      ></iframe>
      {props.caption && (
        <p class="text-gray my-2 text-center text-sm">{props.caption}</p>
      )}
    </div>
  );
}
