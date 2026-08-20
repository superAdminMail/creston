export function resolveSupportVerificationBrandName(siteName?: string | null) {
  return siteName?.trim() || "Company";
}

export function getSupportVerificationCopy(siteName?: string | null) {
  const brandName = resolveSupportVerificationBrandName(siteName);

  return {
    brandName,
    notificationTitle: `${brandName} Support Verification`,
    notificationMessage: `A ${brandName} support representative is requesting confirmation that they are speaking with the account owner.`,
    userHeading: `${brandName} Support Verification`,
    userDescription:
      "A support representative is requesting confirmation before discussing account-related information with you.",
    userExpectationMessage: `Only confirm this session if you recognize the representative and are currently speaking with them through an expected ${brandName} support channel.`,
    adminPreviewTitle: `${brandName} Support Verification`,
    adminPreviewDescription:
      "The customer will see this as a dashboard notice and can confirm that they are speaking with the designated support representative.",
  };
}
