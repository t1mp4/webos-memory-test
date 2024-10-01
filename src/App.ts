import { Component } from "@lightningjs/core";
import LoadPlaylistButton from "./LoadPlaylistButton";
import { service } from "./service";

interface TemplateSpec extends Component.TemplateSpec {
  Status: object;
  LoadPlaylistButton: typeof LoadPlaylistButton;
}

export default class
  extends Component<TemplateSpec>
  implements Component.ImplementTemplateSpec<TemplateSpec>
{
  static override _template(): Component.Template<TemplateSpec> {
    return {
      w: 1920,
      h: 1080,
      rect: true,
      color: 0xff000000,

      Status: {
        text: {
          text: "Playlist not in memory",
          textColor: 0xffffffff,
        },
      },

      LoadPlaylistButton: {
        type: LoadPlaylistButton,
      },
    };
  }

  override _handleEnter() {
    const Status = this.getByRef("Status")!;
    Status.text!.text = "Loading playlist";
    service.update().then(() => {
      Status.text!.text = "Playlist is now in memory";
    });
  }

  override _getFocused() {
    return this.getByRef("LoadPlaylistButton");
  }
}
