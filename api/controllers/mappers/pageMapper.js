/**
 *  maps a page object to a public representation.
 * @param {*} page the page as returned from webpageRepo
 * @returns a webpage matching the WebPage openapi schema
 */
export function ToPublicPage(page){
	return {
		id: page.id,
		title: page.title,
		content: page.content,
		published: page.published,
		sitewide: page.sitewide,
		special: page.special,
		slug: page.slug,
		pageOrder: page.pageOrder,
		parentId: page.parentId,
		updatedAt: page.updatedAt,
	};
}