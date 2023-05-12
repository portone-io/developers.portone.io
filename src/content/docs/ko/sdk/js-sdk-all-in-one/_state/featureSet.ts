import { signal } from "@preact/signals";
import type { PgProviderID } from "~/consts";

const pgProviders = signal<PgProviderID[]>([]);
const serviceVersion = signal<"v1" | "v2" | null>(null);

const FeatureSet = { pgProviders, serviceVersion };

export default FeatureSet;
