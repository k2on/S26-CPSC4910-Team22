"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export default function Page() {
    const { data, isPending } = authClient.useSession();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const ref = useRef<HTMLInputElement | null>(null);



    const generateUploadUrl = useMutation(api.myFunctions.generateUploadUrl);
    const getImageUrl = useMutation(api.myFunctions.getImageUrl);

    const changeImage = async () => {
        const file = ref.current?.files![0]!;
        const url = await generateUploadUrl();

        const uploadRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const json = await uploadRes.json();
        console.log(json);

        const imageUrl = await getImageUrl({ id: json.storageId });

        authClient.updateUser({
            image: imageUrl
        })

    }

    const changeEmail = () => {
        authClient.changeEmail({
            newEmail: email,
            callbackURL: "/"
        })
        toast.success("Email updated successfully!", { position: "top-left" })
    }

    const changeName = () => {
        authClient.updateUser({
            name: name
        })
        toast.success("Name updated successfully!", { position: "top-left" })
    }

    return (
        <main className="max-w-lg mx-auto">
            <div className="flex flex-col">
                EDIT PROFILE
                <Separator />
                <div className="flex flex-col">
                    <Button asChild variant="outline">
                        <Link href="/">Back</Link>
                    </Button>
                </div>
            </div>
            <div>Account Name:</div>
            <div className="flex flex-row">
                <Input placeholder={data?.user.name} type="name" onChange={(e) => setName(e.target.value)} />
                <Button onClick={changeName}>Update Name</Button>
            </div>
            <div>Account Email:</div>
            <div className="flex flex-row">
                <Input placeholder={data?.user.email} type="email" onChange={(e) => setEmail(e.target.value)} />
                <Button style={{ textAlign: "left" }} onClick={changeEmail}>Update Email</Button>
            </div>

            <div>Account Email:</div>
            <div className="flex flex-row">
                <Input type="file" ref={ref} />
                <Button onClick={changeImage}>Update Image</Button>
            </div>





        </main>
    );
}
