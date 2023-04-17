import { NavOpenStates, navOpenStatesSignal } from "~/state/nav";
declare const navOpenStates: NavOpenStates;

const clientNavOpenStates = (navOpenStatesSignal.value = {
  ...navOpenStatesSignal.value,
  ...navOpenStates,
});
console.log(clientNavOpenStates);
