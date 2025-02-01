import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetTicketSectors = () => {
  const query = useQuery({
    queryKey: ["ticket-sectors"],
    queryFn: async () => {
      const res = await client.api["ticket-sectors"].$get();

      if (!res.ok) {
        throw new Error("Failed to fetch ticket sectors");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};
