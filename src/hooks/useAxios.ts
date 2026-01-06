import api from "@/lib/axios";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  method: "post" | "get" | "put";
  postData?: Record<string, any>;
  defaultValue?: any;
};

const useAxios = <T,>(
  { url, postData, method = "get", defaultValue }: Props,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(defaultValue || null);
  const [loading, setLoading] = useState(false);

  const exec = async () => {
    setLoading(true);
    try {
      const response = await (method == "get"
        ? api[method](`${process.env.NEXT_PUBLIC_API_URL}/${url}`)
        : api[method](
            `${process.env.NEXT_PUBLIC_API_URL}/${url}`,
            postData
          ));
      setData(response.data);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    exec();
  }, dependencies);

  return {
    data,
    loading,
    refetch: exec,
  };
};

export default useAxios;
