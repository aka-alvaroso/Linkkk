import React from 'react'
import { Link } from "@/app/stores/linkStore";
import LinkItem from "./LinkItem";


interface LinkDetailsProps {
  links: Link[];
}

const LinkDetails: React.FC<LinkDetailsProps> = ({ links }) => {
  return (
    <div className='space-y-4'>
      <div className='space-y-4 overflow-visible'>
        <div className='space-y-1'>
          {links.map((link) => {
            return (
              <LinkItem key={link.id} view={'details'} data={link} />
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default LinkDetails;
