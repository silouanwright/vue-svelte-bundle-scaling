/// <reference types="vite/client" />

interface Window {
  __OPENSLIDES_TEST_ENV__?: boolean;
}

declare var __OPENSLIDES_TEST_ENV__: boolean | undefined;
