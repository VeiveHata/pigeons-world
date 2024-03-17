import { Slot, component$ } from "@builder.io/qwik";

type Props = {
  href: string;
};

export default component$(({ href }: Props) => {
  return (
    <a href={href} class="text-lg font-bold leading-6 text-green">
      <Slot />
    </a>
  );
});
