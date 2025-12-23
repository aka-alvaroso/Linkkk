import React, { useState, useEffect, useRef } from 'react'
import { Link } from "@/app/types";
import LinkItem from "./LinkItem";
import Button from '../ui/Button/Button';
import { TbPlus } from 'react-icons/tb';
import CreateLinkDrawer from '../Drawer/CreateLinkDrawer';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';


interface LinkDetailsProps {
  links: Link[];
}

const LinkDetails: React.FC<LinkDetailsProps> = ({ links }) => {
  const t = useTranslations('Dashboard');
  const [createLinkDrawer, setCreateLinkDrawer] = useState(false);
  const initialLoadRef = useRef(true);
  const prevLinksCountRef = useRef(links.length);

  useEffect(() => {
    if (initialLoadRef.current && links.length > 0) {
      initialLoadRef.current = false;
    }
    prevLinksCountRef.current = links.length;
  }, [links.length]);

  return (
    <div className='space-y-4'>
      <div className='space-y-4 overflow-visible'>
        <div className='space-y-1'>
          {links.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-4'>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: "backInOut" }}
                className='text-center text-gray-500'>
                {t('noLinksFound')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4, ease: "backInOut" }}
              >
                <Button
                  variant='solid'
                  size='md'
                  rounded='xl'
                  className='hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]'
                  leftIcon={<TbPlus size={20} />}
                  onClick={() => {
                    setCreateLinkDrawer(true);
                  }}
                  >
                  {t('createLink')}
                </Button>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {links.map((link, index) => {
                const isInitialLoad = initialLoadRef.current;
                const staggerDelay = isInitialLoad ? index * 0.05 : 0;

                return (
                  <motion.div
                    key={link.shortUrl}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -100 }}
                    transition={{
                      layout: { duration: 0.3, ease: "easeInOut" },
                      opacity: { duration: 0.2, delay: staggerDelay },
                      y: { duration: 0.3, delay: staggerDelay },
                    }}
                  >
                    <LinkItem view={'details'} data={link} />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
      <CreateLinkDrawer open={createLinkDrawer} onClose={() => setCreateLinkDrawer(false)} />
    </div>
  );
};

export default LinkDetails;
