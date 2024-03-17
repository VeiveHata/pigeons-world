import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1 class="text-9xl text-center text-green mx-auto">Hello, You!</h1>
    </>
  );
});

export const head: DocumentHead = {
  title: "Trying 2B Happy",
  meta: [
    {
      name: "description",
      content: "Trying 2B Happy for Everyone!",
    },
  ],
};
