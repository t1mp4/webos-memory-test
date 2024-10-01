import { Component, OutlineShader } from "@lightningjs/core";

interface TemplateSpec extends Component.TemplateSpec {
  Label: object;
}

export default class
  extends Component<TemplateSpec>
  implements Component.ImplementTemplateSpec<TemplateSpec>
{
  static override _template(): Component.Template<TemplateSpec> {
    return {
      mount: 0.5,
      x: 1920 / 2,
      y: 1080 / 2,
      rect: true,
      color: 0xffffffff,
      shader: {
        type: OutlineShader,
        color: 0xffadd8e6,
        width: 0,
      },
      Label: {
        shader: null,
        x: 32,
        y: 16,
        text: {
          textColor: 0xff000000,
          fontSize: 64,
          text: "Load playlist",
        },
      },
    };
  }

  override _setup() {
    const Label = this.getByRef("Label")!;
    Label.on("txLoaded", (txt) => {
      const width = txt.getRenderWidth();
      const height = txt.getRenderHeight();

      this.w = width + 32 * 2;
      this.h = height + 16 * 2;
    });
  }

  override _focus() {
    this.patch({
      shader: {
        width: 16,
      },
    });
  }

  override _unfocus() {
    this.patch({
      shader: {
        width: 0,
      },
    });
  }
}
