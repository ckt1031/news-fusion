import { cn } from "@/app/utils/cn";
import { FAVICON_BASE_URL } from "@/config/api";

interface PublisherComponentProps {
  url: string;
  publisher: string;
  className?: string;
}

export default function PublisherComponent({ publisher, className, url }: PublisherComponentProps) {
  return <div className={cn(className)}>
    <div className="flex flex-row items-center">
    <img className="w-4 h-4 mr-1 rounded-full" src={`${FAVICON_BASE_URL}${url}`} alt="favicon" />
    <span>{publisher}</span>
    </div>
  </div>;
}