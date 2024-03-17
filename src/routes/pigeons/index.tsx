import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1 class="text-9xl text-center text-green mx-auto">Hello, Pigeon!</h1>
    </>
  );
});

export const head: DocumentHead = {
  title: "Pigeons World",
  meta: [
    {
      name: "description",
      content: "Pigeons World for Everyone!",
    },
  ],
};
