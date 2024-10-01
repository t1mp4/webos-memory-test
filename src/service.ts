import { parseM3U, type M3uHeaders, type M3uChannel } from "./m3u-parser";

type Channel = [
  name: string,
  url: string,
  imageURL: string | null,
  isFavorite: boolean
];
class Service {
  public categories: [name: string, channelIndexes: number[]][] = [];
  public channels: Channel[] = [];

  public async update() {
    const DEFAULT_CATEGORY_NAME = "Uncategorized";
    const DEFAULT_CHANNEL_NAME = "Unnamed";
    this.categories = [];
    this.channels = [];

    let res: Response | null = await fetch(
      `${import.meta.env.BASE_URL}/playlist.m3u`
    );
    let rawM3U: string | null = await res.text();
    res = null;

    const parsedM3U = parseM3U(rawM3U) as {
      headers?: M3uHeaders | null;
      channels: M3uChannel[];
    };
    parsedM3U.headers = null;
    rawM3U = null;

    for (let i = 0; i < parsedM3U.channels.length; i++) {
      const channel = parsedM3U.channels[i];
      const name = channel.name || channel.tvgname || DEFAULT_CHANNEL_NAME;
      const url = channel.url;
      const imageURL = channel.tvglogo;
      const channelCategories = (
        channel.grouptitle ||
        channel.tvggroup ||
        channel.tvgtype ||
        DEFAULT_CATEGORY_NAME
      ).split(";");
      for (const category of channelCategories) {
        const idx = this.categories.findIndex((c) => c[0] === category);
        if (idx === -1) {
          this.categories.push([category, [i]]);
        } else {
          this.categories[idx][1].push(i);
        }
      }
      (parsedM3U.channels[i] as unknown as Channel) = [
        name,
        url,
        imageURL || null,
        false,
      ];
    }

    this.channels = parsedM3U.channels as unknown as Channel[];
  }
}

export const service = new Service();
