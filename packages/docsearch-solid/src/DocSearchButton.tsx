import { Ref } from "@solid-primitives/refs";
import clsx from "clsx";
import {
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  type JSXElement,
  mergeProps,
  on,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";

import { ControlKeyIcon } from "./icons/ControlKeyIcon";
import { SearchIcon } from "./icons/SearchIcon";

export type ButtonTranslations = {
  buttonText: string;
  buttonAriaLabel: string;
};

export type DocSearchButtonProps =
  JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    translations?: ButtonTranslations;
    ref?: Ref<HTMLButtonElement>;
  };

const ACTION_KEY_DEFAULT = "Ctrl";
const ACTION_KEY_APPLE = "⌘";

function isAppleDevice(): boolean {
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
}

export function DocSearchButton(_props: DocSearchButtonProps) {
  const mergedProps = mergeProps(
    {
      translations: {
        buttonText: "Search",
        buttonAriaLabel: "Search",
      },
    },
    _props,
  );
  const [locals, others] = splitProps(mergedProps, ["translations", "ref"]);

  const [key, setKey] = createSignal<
    typeof ACTION_KEY_APPLE | typeof ACTION_KEY_DEFAULT | null
  >(null);

  createEffect(() => {
    if (typeof navigator !== "undefined") {
      if (isAppleDevice()) {
        setKey(ACTION_KEY_APPLE);
      } else {
        setKey(ACTION_KEY_DEFAULT);
      }
    }
  });

  const keyData = createMemo(
    on(key, (key) => {
      if (key === ACTION_KEY_DEFAULT) {
        return {
          actionKeyReactsTo: ACTION_KEY_DEFAULT,
          actionKeyAltText: "Ctrl",
          actionKeyChild: <ControlKeyIcon />,
        };
      } else {
        return {
          actionKeyReactsTo: "Meta",
          actionKeyAltText: "Command",
          actionKeyChild: key,
        };
      }
    }),
  );

  return (
    <button
      type="button"
      class="DocSearch DocSearch-Button"
      aria-label={`${locals.translations.buttonAriaLabel} (${keyData().actionKeyAltText}+K)`}
      {...others}
      ref={locals.ref}
    >
      <span class="DocSearch-Button-Container">
        <SearchIcon />
        <span class="DocSearch-Button-Placeholder">
          {locals.translations.buttonText}
        </span>
      </span>

      <span class="DocSearch-Button-Keys">
        <Show when={key() !== null}>
          <>
            <DocSearchButtonKey reactsToKey={keyData().actionKeyReactsTo}>
              {keyData().actionKeyChild}
            </DocSearchButtonKey>
            <DocSearchButtonKey reactsToKey="k">K</DocSearchButtonKey>
          </>
        </Show>
      </span>
    </button>
  );
}

type DocSearchButtonKeyProps = {
  reactsToKey?: string;
  children?: JSXElement;
};

function DocSearchButtonKey(props: DocSearchButtonKeyProps) {
  const [isKeyDown, setIsKeyDown] = createSignal(false);

  const reactsToKey = createMemo(() => props.reactsToKey);

  createEffect(
    on(reactsToKey, (reactsToKey) => {
      if (!reactsToKey) {
        return;
      }

      function handleKeyDown(e: KeyboardEvent): void {
        if (e.key === reactsToKey) {
          setIsKeyDown(true);
        }
      }

      function handleKeyUp(e: KeyboardEvent): void {
        if (
          e.key === reactsToKey ||
          // keyup doesn't fire when Command is held down,
          // workaround is to mark key as also released when Command is released
          // See https://stackoverflow.com/a/73419500
          e.key === "Meta"
        ) {
          setIsKeyDown(false);
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      onCleanup(() => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      });
    }),
  );

  return (
    <kbd
      class={clsx(
        "DocSearch-Button-Key",
        isKeyDown() && "DocSearch-Button-Key--pressed",
      )}
    >
      {props.children}
    </kbd>
  );
}
