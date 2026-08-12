import { ComponentProps } from 'lib/component-props';

export interface Enquiry {
  Id: string;
  Name: string;
  Email: string;
  Message: string;
  Source: string;
  CreatedOn: string;
  ModifiedOn: string;
}

export interface EnquiriesApiResponse {
  Success: boolean;
  Message: string;
  Data: Enquiry[];
}

// No Sitecore fields — data is fetched from the Azure Function proxy
export interface EnquiriesListProps extends ComponentProps {
  fields?: Record<string, never>;
}
