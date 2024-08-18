export type PhoneNumber = {
  name?: string;
  number?: string;
  countryCode?: string;
};

export type SMSExtract = {
  to: string;
  from: PhoneNumber;
  parts: number;
  text: {
    raw: string;
    links?: string[];
    otps?: string[];
  };
};
