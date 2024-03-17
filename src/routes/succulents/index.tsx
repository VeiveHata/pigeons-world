import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1 class="text-9xl text-center text-green mx-auto">Hello, Succulent!</h1>
    </>
  );
});

export const head: DocumentHead = {
  title: "Succulents World",
  meta: [
    {
      name: "description",
      content: "Succulents World for Everyone!",
    },
  ],
};
