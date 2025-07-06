import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Success Modal Component
export function SuccessModal({
    isOpen,
    onOpenChange
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {

    const router = useRouter()

    const closeFunc = () => {
        onOpenChange(false)
        router.push('/')
    }
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black border-white/20 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-yellow-400 text-xl">Purchase Successful!</DialogTitle>
                </DialogHeader>

                <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-white/80 mb-4">Your order has been completed. <br /> Check your mail for your ticket!</p>

                </div>

                <DialogFooter>
                    <Button
                        onClick={closeFunc}
                        className="bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer hover:cursor-pointer active:scale-95 transition-transform duration-200 w-full"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Legacy component for backward compatibility (if needed elsewhere)
// function CheckoutDialog({
//     isOpen,
//     onOpenChange,
//     disabled
// }: {
//     isOpen: boolean;
//     onOpenChange: (open: boolean) => void;
//     disabled: boolean;
// }) {
//     return (
//         <Dialog open={isOpen} onOpenChange={onOpenChange}>
//             <DialogContent className="bg-black border-white/20 text-white max-w-md">
//                 <DialogHeader>
//                     <DialogTitle className="text-yellow-400">Complete Your Purchase</DialogTitle>

//                 </DialogHeader>

//                 <div className="text-center py-8">
//                     <div className="text-6xl mb-4">✅</div>
//                     <p className="text-white/80 mb-4">Payment integration coming soon!</p>
//                     <p className="text-sm text-white/60">
//                         We're working on integrating secure payment options.
//                         Follow us on social media for updates on ticket sales.
//                     </p>
//                 </div>

//                 <DialogFooter>
//                     <Button
//                         onClick={() => onOpenChange(false)}
//                         className="bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer hover:cursor-pointer active:scale-95 transition-transform duration-200"
//                     >
//                         Got it!
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }