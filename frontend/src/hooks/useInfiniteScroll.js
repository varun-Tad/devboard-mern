import { useEffect } from "react";

export default function useInfiniteScroll({ hasMore, loading, onLoadMore }) {
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;

      if (nearBottom && hasMore && !loading) {
        onLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, onLoadMore]);
}
