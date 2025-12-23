import { fetchSchools } from "@/lib/schooldoor-api";
import type { School } from "@/lib/schooldoor-api";
import { ReviewsApp } from "@/components/ReviewsApp";

export default async function ReviewsListContainer() {
    let schools: School[] = [];
    let loadError: string | null = null;

    try {
        schools = await fetchSchools(200);
    } catch (error) {
        console.error("Failed to load schools for review page", error);
        loadError =
            "We couldn’t load the school list right now. Please try again in a bit.";
    }

    if (loadError) {
        return (
            <p className="mt-12 rounded-3xl border border-sd-soft-pink/60 bg-sd-soft-pink/40 p-6 text-center text-sm text-sd-salmon">
                {loadError}
            </p>
        );
    }

    return <ReviewsApp initialSchools={schools} />;
}
