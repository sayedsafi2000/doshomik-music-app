"use client";
import EditForm from "@/components/EditForm";
import { useParams } from "next/navigation";

export default function EditPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <EditForm songId={id} />
    </div>
  );
}