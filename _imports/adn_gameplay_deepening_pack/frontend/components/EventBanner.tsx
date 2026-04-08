type Props = {
  title: string;
  countdown: string;
  subtitle: string;
};

export default function EventBanner(props: Props) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-fuchsia-600/40 to-cyan-500/40 p-5 text-white">
      <div className="text-xs uppercase opacity-80">Limited Event</div>
      <div className="mt-1 text-2xl font-bold">{props.title}</div>
      <div className="mt-2 text-sm opacity-90">{props.subtitle}</div>
      <div className="mt-4 inline-flex rounded-full bg-black/30 px-4 py-2 text-sm">
        Ends in {props.countdown}
      </div>
    </div>
  );
}
