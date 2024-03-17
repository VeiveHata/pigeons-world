import { component$ } from "@builder.io/qwik";
import { COMPANY_NAME } from "~/contsts/common";
import logo from "~/media/logo.png";
import HeaderLink from "./headerLink";

export default component$(() => {
  return (
    <header class="bg-green-light">
      <nav
        class="mx-auto flex items-center justify-center p-6 lg:px-8"
        aria-label="Global"
      >
        <HeaderLink href="/pigeons">Pigeons</HeaderLink>
        <a href="/" class="pl-6 pr-6">
          <span class="sr-only">{COMPANY_NAME}</span>
          <img
            src={logo}
            width={100}
            height={100}
            alt={`${COMPANY_NAME} logo`}
          />
        </a>
        <HeaderLink href="/succulents">Succulents</HeaderLink>
      </nav>
    </header>
  );
});
