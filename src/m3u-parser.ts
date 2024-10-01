export type M3uHeaders = {
  [key: string]: string | undefined;
  xtvgurl?: string;
  urltvg?: string;
};

type M3uPlaylist = {
  channels: M3uChannel[];
  headers?: M3uHeaders;
};

export type M3uChannel = {
  url: string;

  name?: string;
  tvgname?: string;

  grouptitle?: string;
  tvggroup?: string;
  tvgtype?: string;

  tvglogo?: string;
};

const attributeMap = {
  "tvg-name": "tvgname",

  "group-title": "grouptitle",
  "tvg-group": "tvggroup",
  "tvg-type": "tvgtype",

  "tvg-logo": "tvglogo",
};

const space = " ".charCodeAt(0);
const hash = "#".charCodeAt(0);
const equal = "=".charCodeAt(0);
const colon = ":".charCodeAt(0);
const comma = ",".charCodeAt(0);
const three = "3".charCodeAt(0);
const newLine = "\n".charCodeAt(0);
const tab = "\t".charCodeAt(0);
const carriageReturn = "\r".charCodeAt(0);
const stringE = "E".charCodeAt(0);
const stringX = "X".charCodeAt(0);
const stringT = "T".charCodeAt(0);
const stringI = "I".charCodeAt(0);
const stringN = "N".charCodeAt(0);
const stringF = "F".charCodeAt(0);
const stringM = "M".charCodeAt(0);
const stringH = "H".charCodeAt(0);
const stringh = "h".charCodeAt(0);
const stringU = "U".charCodeAt(0);

/**
 * parseM3U
 *
 * Parses an M3U file and returns an `M3uPlaylist` object
 *
 * @param m3uFileContents The contents of the M3U file
 *
 * @example
 * ```ts
 * import { parseM3U } from "@iptv/playlist";
 *
 * const m3u = `#EXTM3U
 * #EXTINF:-1 tvg-id="1" tvg-name="Channel 1" tvg-language="English" tvg-logo="http://example.com/logo.png" group-title="News" tvg-url="http://example.com/tvg.xml" timeshift="1" catchup="default" catchup-days="7" catchup-source="default" x-tvg-url="http://example.com/tvg.xml" url-tvg="http://example.com/tvg.xml" tvg-rec="default",Channel 1
 * http://example.com/stream.m3u8
 * `;
 *
 * const playlist = parseM3U(m3u);
 * ```
 */
function parseM3U(m3uFileContents: string): M3uPlaylist {
  const channels: M3uChannel[] = [];
  const headers: M3uHeaders = {};

  let currentPosition = 0;
  let currentChannel: M3uChannel = { url: "" };
  let currentAttribute = "";
  let currentSection: "header" | "channel" | "http" | null = null;

  while (currentPosition < m3uFileContents.length) {
    const char = m3uFileContents.charCodeAt(currentPosition);

    if (
      char === space ||
      char === tab ||
      char === carriageReturn ||
      char === newLine
    ) {
      currentPosition++;
      if (char === newLine) {
        currentAttribute = "";
      }
      continue;
    }

    let endOfLineIndex = m3uFileContents.indexOf("\n", currentPosition);
    if (endOfLineIndex === -1) {
      endOfLineIndex = m3uFileContents.length;
    }

    // Could be a comment or a tag
    if (char === hash) {
      currentSection = null;
      // EXTM3U
      if (
        /* E */ m3uFileContents.charCodeAt(currentPosition + 1) === stringE &&
        /* X */ m3uFileContents.charCodeAt(currentPosition + 2) === stringX &&
        /* T */ m3uFileContents.charCodeAt(currentPosition + 3) === stringT &&
        /* M */ m3uFileContents.charCodeAt(currentPosition + 4) === stringM &&
        /* 3 */ m3uFileContents.charCodeAt(currentPosition + 5) === three &&
        /* U */ m3uFileContents.charCodeAt(currentPosition + 6) === stringU
      ) {
        // Parse the header tag and value

        currentPosition += 6;
        currentSection = "header";
      } else if (
        /* E */ m3uFileContents.charCodeAt(currentPosition + 1) === stringE &&
        /* X */ m3uFileContents.charCodeAt(currentPosition + 2) === stringX &&
        /* T */ m3uFileContents.charCodeAt(currentPosition + 3) === stringT &&
        /* I */ m3uFileContents.charCodeAt(currentPosition + 4) === stringI &&
        /* N */ m3uFileContents.charCodeAt(currentPosition + 5) === stringN &&
        /* F */ m3uFileContents.charCodeAt(currentPosition + 6) === stringF &&
        /* : */ m3uFileContents.charCodeAt(currentPosition + 7) === colon
      ) {
        currentPosition += 7;
        currentSection = "channel";
        currentChannel = { url: "" };
      } else {
        // Comment
        currentPosition = endOfLineIndex;
        continue;
      }
    }

    if (char === stringh || char === stringH) {
      // http
      currentSection = "http";

      currentChannel.url = m3uFileContents
        .slice(currentPosition, endOfLineIndex)
        .trim();
      currentPosition = endOfLineIndex;

      channels.push(currentChannel);
      currentChannel = { url: "" };
      continue;
    }

    // Channel name after comma
    if (char === comma) {
      currentSection = "channel";
      currentChannel.name = m3uFileContents
        .slice(currentPosition + 1, endOfLineIndex)
        .trim();
      currentPosition = endOfLineIndex;
      currentSection = null;
      continue;
    }

    if ((char > 64 && char < 91) || (char > 96 && char < 123) || char === 45) {
      const indexOfNextEquals = m3uFileContents.indexOf("=", currentPosition);

      currentAttribute = m3uFileContents.slice(
        currentPosition,
        indexOfNextEquals
      );
      currentPosition = indexOfNextEquals;
      continue;
    }

    // collect attribute
    if (char === equal) {
      // Skip the equals sign and first quote
      currentPosition = currentPosition + 2;

      const indexOfNextQuote = m3uFileContents.indexOf('"', currentPosition);
      const attributeValue = m3uFileContents.slice(
        currentPosition,
        indexOfNextQuote
      );
      currentPosition = indexOfNextQuote;

      currentAttribute = currentAttribute.toLowerCase();

      if (currentAttribute in attributeMap) {
        const attr =
          attributeMap[currentAttribute as keyof typeof attributeMap];

        if (currentSection === "header") {
          headers[attr] = attributeValue;
        } else {
          currentChannel[attr as keyof M3uChannel] = attributeValue;
        }
      }

      currentAttribute = "";
    }

    currentPosition++;
  }

  return { channels, headers };
}

export { parseM3U };
