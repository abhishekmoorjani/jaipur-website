const ADDRESS = "abi_ind@hotmail.com";

/**
 * The contact address, exempted from Cloudflare's email obfuscation.
 *
 * Scrape Shield rewrites every mailto: link it serves into a
 * /cdn-cgi/l/email-protection URL and injects a decoder script. A visitor
 * without JavaScript then gets Cloudflare's "You are unable to access this
 * email address" page instead of the address, which was measured on the live
 * Impressum. Section 5 DDG requires the contact details to be unmittelbar
 * erreichbar, directly reachable, so an address that only resolves once a
 * script runs is a defect on the one page that legally may not have one.
 *
 * Cloudflare's documented exemption is a literal HTML comment pair. JSX
 * comments compile away and never reach the served markup, so the anchor has
 * to be emitted as raw HTML. The content is a module constant with no props
 * and no interpolation, so there is no injection surface here.
 *
 * The alternative is switching Email Address Obfuscation off for the whole
 * zone in the Cloudflare dashboard. This is narrower: it exempts only the two
 * legal pages that must stay readable.
 */
export default function ContactEmail() {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html:
          `<!--email_off--><a href="mailto:${ADDRESS}" style="color:inherit">${ADDRESS}</a><!--/email_off-->`,
      }}
    />
  );
}
