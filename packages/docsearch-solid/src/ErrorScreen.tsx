import { mergeProps } from "solid-js";

import { ErrorIcon } from "./icons";

export type ErrorScreenTranslations = {
  titleText: string;
  helpText: string;
};

type ErrorScreenProps = {
  translations?: ErrorScreenTranslations;
};

export function ErrorScreen(_props: ErrorScreenProps) {
  const props = mergeProps(
    {
      translations: {
        titleText: "Unable to fetch results",
        helpText: "You might want to check your network connection.",
      },
    },
    _props,
  );

  return (
    <div class="DocSearch-ErrorScreen">
      <div class="DocSearch-Screen-Icon">
        <ErrorIcon />
      </div>
      <p class="DocSearch-Title">{props.translations.titleText}</p>
      <p class="DocSearch-Help">{props.translations.helpText}</p>
    </div>
  );
}
