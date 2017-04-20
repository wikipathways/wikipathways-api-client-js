import {uniq, values} from 'lodash';

/*
// file format as requested -> standardized media type
export const REQUESTED_TO_IANA_GENERIC = {
	'xml':'application/xml',
	'application/ld+json':'application/ld+json',
	'application/json':'application/ld+json',
	'json':'application/ld+json',
	'jsonld':'application/ld+json'
};
//*/

// file format as requested to standardized media type appropriate for pathway data
export const REQUESTED_TO_IANA_FOR_PATHWAYS = {
	'application/vnd.biopax.rdf+xml':'application/vnd.biopax.rdf+xml',
	'application/biopax.rdf+xml':'application/vnd.biopax.rdf+xml',
	'application/biopax+xml':'application/vnd.biopax.rdf+xml',
	'application/rdf+xml':'application/vnd.biopax.rdf+xml',
	'biopax':'application/vnd.biopax.rdf+xml',
	'application/owl+xml':'application/vnd.biopax.rdf+xml',
	'owl':'application/vnd.biopax.rdf+xml',
	'application/vnd.gpml+xml':'application/vnd.gpml+xml',
	'application/gpml+xml':'application/vnd.gpml+xml',
	'gpml':'application/vnd.gpml+xml',
	'xml':'application/vnd.gpml+xml',
	'application/xml':'application/vnd.gpml+xml',
	'application/ld+json':'application/ld+json',
	'application/json':'application/ld+json',
	'json':'application/ld+json',
	'jsonld':'application/ld+json',
	'pvjson':'application/ld+json',
	'application/pdf':'application/pdf',
	'pdf':'application/pdf',
	'image/png':'image/png',
	'png':'image/png',
	'image/svg+xml':'image/svg+xml',
	'application/svg+xml':'image/svg+xml',
	'svg':'image/svg+xml',
	'text/genelist':'text/genelist',
	'text/plain':'text/genelist',
	'genelist':'text/genelist',
	'text/pwf':'text/pwf',
	'text/eugene':'text/pwf',
	'eugene':'text/pwf',
	'pwf':'text/pwf'
};

// or at least types we may eventually support
export const SUPPORTED = uniq(values(REQUESTED_TO_IANA_FOR_PATHWAYS));

// convert from standardized format (as specified above) to
// the format used by the current (2014-06-09) WikiPathways API
// for the pathway
export const IANA_TO_WP_API_BODY = {
	'application/vnd.biopax.rdf+xml':'owl',
	'application/vnd.gpml+xml':'gpml',
	// TODO the WikiPathways API cannot currently return the pathway as JSON,
	// only the pathway metadata.
	//'application/ld+json':'json',
	'application/ld+json':'gpml',
	'application/pdf':'pdf',
	'image/png':'png',
	'image/svg+xml':'svg',
	'text/genelist':'txt',
	'text/pwf':'pwf'
};

// convert from standardized format (as specified above) to
// the format used by the current (2015-04-29) WikiPathways API
// for the response envelope
export const IANA_TO_WP_API_ENVELOPE = {
	'application/vnd.biopax.rdf+xml':'xml',
	'application/xml':'xml',
	'application/vnd.gpml+xml':'xml',
	'application/ld+json':'json',
	'text/genelist':'text',
	'text/pwf':'text'
};

