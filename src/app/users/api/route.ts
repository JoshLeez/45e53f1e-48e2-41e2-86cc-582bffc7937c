import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(){
    try{
        const users = await prisma.users.findMany()
        return Response.json(users)
    }catch(error){
        console.log(error)
    }
}


export async function POST(request: NextRequest){
    try{
        const {firstname, lastname, position, phoneNumber, email} =  await request.json();
        const nameRegex = /^[a-zA-Z]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!nameRegex.test(firstname)) {
            return Response.json({ error: "Invalid first name" }, {status: 400});
        }

        if (!nameRegex.test(lastname)) {
            return Response.json({ error: "Invalid last name" }, {status: 400});
        }

        if (!emailRegex.test(email)) {
            return Response.json({ error: "Invalid email format"}, {status: 400});
        }

        const result = await prisma.users.create({
            data: {
             firstname, lastname, position, phoneNumber, email
            },
          })
        return Response.json({data :result})
    }catch(error){
        console.log(error)
    }
}

export async function PATCH(req: NextRequest){
    try {
        const editedUsers = await req.json();
        const result = await Promise.all(editedUsers.map(async (user: any) => {
          await prisma.users.update({
            where: { id: user.id },
            data: user,
          });
        }));
        console.log("Users updated successfully");
        return Response.json(result)
      } catch (error) {
        console.error(error);
      }
}