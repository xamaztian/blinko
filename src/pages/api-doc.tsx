import dynamic from "next/dynamic";
import React from "react";
const DynamicSwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <p>Loading Component...</p>,
});

export default function Page({ openApiDoc }) {
  return (
    <section className="overflow-y-scroll h-[100vh]">
      {/* @ts-ignore */}
      <DynamicSwaggerUI spec={openApiDoc} />
    </section>
  );
}

export const getServerSideProps = async () => {
  const { openApiDoc } = await import("@/server/remult")
  return {
    props: {
      openApiDoc: JSON.parse(JSON.stringify(openApiDoc)),
    },
  };
};
