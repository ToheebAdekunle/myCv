import { Composition } from "remotion";
import { TitleCard, titleCardSchema } from "./TitleCard";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={titleCardSchema}
        defaultProps={{
          title: "How a 30-Year-Old Lost $8 Billion Overnight",
          subtitle: "The rise and fall of FTX",
        }}
      />
    </>
  );
};
