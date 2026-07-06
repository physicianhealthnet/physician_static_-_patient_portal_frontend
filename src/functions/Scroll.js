export const scroll = (direction, index, scrollContainerRefs) => {
    if (scrollContainerRefs.current[index]) {
        const current = scrollContainerRefs.current[index];
        const scrollAmount = 340;
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
};