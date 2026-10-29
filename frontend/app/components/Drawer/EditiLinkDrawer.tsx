import Drawer from '@/app/components/ui/Drawer/Drawer';
import type { Link } from '@/app/types';
import LinkEditor from './LinkEditor';

interface EditiLinkDrawerProps {
    open: boolean;
    onClose: () => void;
    link: Link;
}

/** Side-drawer presentation of the link editor. */
export default function EditiLinkDrawer({ open, onClose, link }: EditiLinkDrawerProps) {
    return (
        <Drawer
            open={open}
            onClose={onClose}
            modal
            placement='right'
            size='md'
            rounded='3xl'
            className='h-full overflow-hidden flex flex-col'
        >
            <LinkEditor open={open} onClose={onClose} link={link} />
        </Drawer>
    );
}
