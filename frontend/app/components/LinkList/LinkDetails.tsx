import React, { useState } from 'react'
import { Link } from "@/app/stores/linkStore";
import LinkItem from "./LinkItem";
import Button from '../ui/Button/Button';
import { TbPlus } from 'react-icons/tb';
import CreateLinkDrawer from '../Drawer/CreateLinkDrawer';

interface LinkDetailsProps {
  links: Link[];
}

const LinkDetails: React.FC<LinkDetailsProps> = ({ links }) => {
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);

  return (
    <div className='space-y-4'>
      <div className='space-y-4 overflow-visible'>
        <div className='space-y-1'>
          {links.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-4'>
              <p className='text-center text-gray-500'>
                No links found
              </p>
              <Button
                variant='solid'
                size='md'
                rounded='xl'
                className=''
                leftIcon={<TbPlus size={20} />}
                onClick={() => {
                  setCreateLinkDrawer(true);
                }}
              >
                Create link
              </Button>
            </div>
          ) : (
            links.map((link) => {
              return (
                <LinkItem key={link.shortUrl} view={'details'} data={link} />
              )
            })
          )}
        </div>
      </div>
      <CreateLinkDrawer open={createLinkDrawer} onClose={() => setCreateLinkDrawer(false)} />
    </div>
  );
};

export default LinkDetails;
