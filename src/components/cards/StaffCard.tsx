import React from "react";
import BaseCard from "@/components/ui/BaseCard";

interface StaffCardProps {
  staff: Staff;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff }) => {
  return (
    <BaseCard
      href={`/staff/${staff.id}`}
      imageUrl={staff.imageUrl}
      title={staff.name}
      subtitle={staff.role}
      hoverEffect="zoom"
      size="sm"
    />
  );
};

export default StaffCard;
