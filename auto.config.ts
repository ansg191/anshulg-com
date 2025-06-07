import { AutoRc } from "auto";

export default function rc(): AutoRc {
  return {
    plugins: [
      "git-tag",
      "exec",
      {
        version: "npm version $ARG_0",
      },
    ],
    owner: "ansg191",
    repo: "anshulg-com",
    author: "Auto <auto@git.anshulg.com>",
  };
}
