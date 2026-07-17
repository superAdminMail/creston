import { useEffect, useState } from "react";

type UseResponsivePageSizeOptions = {
  mobilePageSize: number;
  desktopPageSize: number;
  breakpoint?: number;
};

export function useResponsivePageSize({
  mobilePageSize,
  desktopPageSize,
  breakpoint = 768,
}: UseResponsivePageSizeOptions) {
  const [pageSize, setPageSize] = useState(mobilePageSize);

  useEffect(() => {
    const updatePageSize = () => {
      setPageSize(
        window.innerWidth >= breakpoint ? desktopPageSize : mobilePageSize,
      );
    };

    updatePageSize();
    window.addEventListener("resize", updatePageSize);

    return () => window.removeEventListener("resize", updatePageSize);
  }, [breakpoint, desktopPageSize, mobilePageSize]);

  return pageSize;
}
