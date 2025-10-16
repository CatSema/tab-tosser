import { getTtlLabel } from "./i18n.js"

// Generate slider marks with localized labels
function generateSliderMarks(): Array<[number, string]> {
	return [
		[0, getTtlLabel(0)],
		[1, getTtlLabel(1)],
		[7, getTtlLabel(7)],
		[31, getTtlLabel(31)]
	]
}

// Initialize with default English labels for compatibility
const sliderMarks: Array<[number, string]> = [
	[0, "manually"],
	[1, "after 1 day"],
	[7, "after 1 week"],
	[31, "after 1 month"]
]

const sliderMarkTtls: Array<number> = sliderMarks.map((option) => option[0])

// Function to update slider marks with localized labels
export function updateSliderMarks(): void {
	const localizedMarks = generateSliderMarks()
	for (let i = 0; i < sliderMarks.length; i++) {
		sliderMarks[i][1] = localizedMarks[i][1]
	}
}

export {
	sliderMarkTtls,
	sliderMarks
}
