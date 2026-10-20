import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { House } from "lucide-react";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type PageBreadcrumbsProps = {
  current: string;
  assignment?: boolean;
};

const linkClass = "inline-flex min-h-11 items-center gap-1.5 rounded-sm font-medium hover:text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function PageBreadcrumbs({ current, assignment = false }: PageBreadcrumbsProps) {
  const parents = [
    ...(current !== "Uppdragsbanken" ? [{ label: "Uppdragsbanken", to: "/" as const }] : []),
    ...(assignment ? [{ label: "Se uppdrag", to: "/uppdrag" as const }] : []),
  ];

  return (
    <Breadcrumb aria-label="Sidstig" className="mb-5 border-b border-border pb-2 sm:mb-6">
      <BreadcrumbList className="gap-x-2 gap-y-0 sm:gap-x-3">
        <BreadcrumbItem>
          <BreadcrumbLink href="https://techtraineetalent.se/" className={linkClass}>
            <House className="size-3.5 shrink-0" aria-hidden="true" />Hem
          </BreadcrumbLink>
        </BreadcrumbItem>
        {parents.map((parent) => (
          <Fragment key={parent.to}>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className={linkClass}>
                <Link to={parent.to}>{parent.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem className="min-w-0 max-w-full">
          <BreadcrumbPage className="break-words py-2.5 font-semibold [overflow-wrap:anywhere]">{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}