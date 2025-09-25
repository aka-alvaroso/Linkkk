import React from 'react'
import Button from "@/app/components/ui/Button/Button";
import { TbPlus, TbEdit} from "react-icons/tb";
import { Link } from "@/app/stores/linkStore";
import LinkItem from "./LinkItem";

interface ShowingProp {
  key: string;
  show: boolean;
  label: string;
  icon: React.ReactNode;
}

interface LinkListProps {
  showingProps: ShowingProp[];
  links: Link[];
}

const LinkList: React.FC<LinkListProps> = ({ showingProps, links }) => {
  return (
    <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between'>
            <h3 className='text-2xl font-black italic'>My links</h3>

            <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' rounded='xl' leftIcon={<TbEdit size={20} />}>
                    Edit view
                </Button>
                <Button variant='solid' size='sm' rounded='xl' leftIcon={<TbPlus size={20} />}>
                    New link
                </Button>
            </div>
        </div>
      <div className='space-y-4 overflow-auto xl:overflow-visible'>
        {/* Header */}
        <div className='flex items-center justify-between py-2 px-4 bg-dark/5 rounded-2xl w-fit xl:w-full'>
          {showingProps.filter((prop) => prop.show).map((prop) => {
            return (
                <p key={prop.label} className='text-md font-bold flex items-center justify-start gap-0.5 min-w-64 max-w-64'>
                    {prop.icon} {prop.label}
                </p>
            )
          })}
        </div>

        {/* Links */}
        <div className='space-y-1'>
          {links.map((link) => {
            return (
              <LinkItem key={link.id} props={showingProps.filter((prop) => prop.show)} view={'list'} data={link} />
            )
          })}
        </div>

      </div>
    </div>
  );
};

export default LinkList;
