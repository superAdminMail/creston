type MapboxAddressContextItem = {
  id?: string;
  text?: string;
  short_code?: string;
};

type MapboxAddressProperties = {
  address_line1?: string;
  address_line2?: string;
  address?: string;
  full_address?: string;
  name?: string;
  text?: string;
  place?: string;
  locality?: string;
  city?: string;
  region?: string;
  state?: string;
  country?: string;
  postcode?: string;
  postal_code?: string;
};

type MapboxAddressFeature = {
  place_name?: string;
  text?: string;
  address?: string | number;
  properties?: MapboxAddressProperties;
  context?: MapboxAddressContextItem[];
};

export type OnboardingAddressFields = {
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
};

function clean(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function asFeature(input: unknown): MapboxAddressFeature | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as Record<string, unknown>;

  if (Array.isArray(record.features) && record.features[0]) {
    return asFeature(record.features[0]);
  }

  if (record.feature) {
    return asFeature(record.feature);
  }

  return record as MapboxAddressFeature;
}

function contextText(
  context: MapboxAddressContextItem[] | undefined,
  prefix: string,
) {
  return clean(
    context?.find((item) => item.id?.startsWith(prefix))?.text ?? "",
  );
}

function firstNonEmpty(...values: Array<string | number | null | undefined>) {
  for (const value of values) {
    const next = clean(String(value ?? ""));
    if (next) {
      return next;
    }
  }

  return "";
}

export function mapMapboxAddressToOnboardingFields(
  input: unknown,
): OnboardingAddressFields | null {
  const feature = asFeature(input);

  if (!feature) {
    return null;
  }

  const properties = feature.properties ?? {};
  const context = feature.context ?? [];
  const streetNumber = firstNonEmpty(properties.address, feature.address);
  const streetName = firstNonEmpty(properties.text, feature.text, properties.name);

  const addressLine1 = firstNonEmpty(
    properties.address_line1,
    [streetNumber, streetName].filter(Boolean).join(" "),
    properties.full_address,
    feature.place_name,
    properties.name,
  );

  const city = firstNonEmpty(
    properties.city,
    properties.locality,
    properties.place,
    contextText(context, "place"),
  );
  const state = firstNonEmpty(
    properties.state,
    properties.region,
    contextText(context, "region"),
  );
  const country = firstNonEmpty(
    properties.country,
    contextText(context, "country"),
  );

  if (!addressLine1 && !city && !state && !country) {
    return null;
  }

  return {
    addressLine1: addressLine1 || undefined,
    city: city || undefined,
    state: state || undefined,
    country: country || undefined,
  };
}
