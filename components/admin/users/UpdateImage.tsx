"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/const";
import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation as useRQMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function UserUpdateImage() {
    const router = useRouter();

    const { data, isPending } = authClient.useSession();
    const generateUploadUrl = useMutation(api.myFunctions.generateUploadUrl);
    const getImageUrl = useMutation(api.myFunctions.getImageUrl);

    const { mutate } = useRQMutation({
        mutationFn: async (input: Parameters<typeof authClient.updateUser>[0]) => authClient.updateUser(input),
        onSuccess: () => router.push("/"),
        onError: (error) => toast.error(error.message)
    })

    const [image, setImage] = useState<File>();
    const [color, setColor] = useState<string>(data?.user.imageBorderColor || "#000000");

    const ref = useRef<HTMLInputElement>(null);

    const avatarImage = image ? URL.createObjectURL(image) : data?.user.image || DEFAULT_PROFILE_IMAGE;


    const onSave = async () => {
        if (!image) return toast.error("Please upload an image");
        const uploadUrl = await generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
        });
        if (!uploadRes.ok) return toast.error("Image upload failed");
        const { storageId } = await uploadRes.json() as { storageId: Id<"_storage"> };
        const url = await getImageUrl({ id: storageId });

        mutate({
            image: url,
            imageBorderColor: color,
        });
    }

    if (isPending) return <div>Loading...</div>;
    if (!data) return <div>You are not logged in</div>;

    return (
        <div>
            <div>
                <Avatar style={{ borderColor: color || data.user.imageBorderColor }} onClick={() => ref?.current?.click()} className="w-64 h-64 border-4 mx-auto">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback>{data?.user.name}</AvatarFallback>
                </Avatar>

                <Input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? undefined)}
                />


                <Input
                    type="color"
                    className="w-16 h-10 cursor-pointer"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>

            <Button onClick={onSave}>
                Save
            </Button>
        </div>
    )
}

