import UsersCard from "@/components/UsersCard";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

async function getUsers() {
  const res = await fetch("http://localhost:3000/users/api", { next : { revalidate: 0 }});
  return res.json();
}

export default async function Home() {
  const userData = await getUsers();

  return (
    <main>
      <Suspense fallback="...Loading">
        <UsersCard userData={userData} />
      </Suspense>
    </main>
  );
}
