import SchedulerModel from "@/models/scheduler.model";
import { Destination, SchedulerType, ShipType } from "./constants";
import SchedulerService from "@/services/scheduler.service";

// helper check whether it's inside the start and end date
export const insideDateTime = (startDateTime: string, endDateTime: string) => {
    const now = new Date().getTime();
    const startDate = new Date(startDateTime).getTime();
    const endDate = new Date(endDateTime).getTime();

    // Check if the current date and time has passed the given date and time
    if (now < startDate || now > endDate) {
        return false;
    } else {
        return true;
    }
};

// helper calculate remaining days
export const calculateRemainingTime = (endDateTime: any, startDateTime?: any) => {
    const end = new Date(endDateTime);
    const start = startDateTime ? new Date(startDateTime) : new Date();

    const differenceInMilliseconds = Math.abs(end.getTime() - start.getTime());

    if (end.getTime() - start.getTime() < 0) return 0;

    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    const differenceInHours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60) % 24);
    const differenceInMinutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const differenceInSeconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

    return {
        days: differenceInDays,
        hours: differenceInHours,
        mins: differenceInMinutes,
        secs: differenceInSeconds,
    };
};

// cron helper payment reminder mails
export const cronPaymentReminderMails = (
        creator: { _id: string; username: string; avatar: string }, 
        winner: { _id: string; name: string; email: string }, 
        auction: { _id: string; endDateTime: Date; photo: string; title: string; winnerMessage: string; shipType: ShipType; destination: Destination }, 
        bidAmount: number, placeNo: number,
    ) => {
        paymentReminder(creator, winner, auction, bidAmount, 24, placeNo);
        paymentReminder(creator, winner, auction, bidAmount, 8, placeNo);
        paymentReminder(creator, winner, auction, bidAmount, 1, placeNo);
};

const paymentReminder = async (
    creator: { _id: string; username: string; avatar: string }, 
    winner: { _id: string; name: string; email: string }, 
    auction: { _id: string; endDateTime: Date; photo: string; title: string; winnerMessage: string; shipType: ShipType; destination: Destination }, 
    bidAmount: number, remainingHour: number, placeNo: number
    ) => {
    // calculate the delivery fee
    const deliveryFee = calculateDeliveryFee(auction.shipType as ShipType, auction.destination as Destination);

    const endTime = new Date(auction?.endDateTime);
    // const executeTime = new Date(endTime.getTime() + (1 * 60 * 1000)); // execute after 1 min <--- test locally
    // const executeTime = new Date(endTime.getTime() + (3 * 60 * 1000)); // execute after 3 min <--- test locally
    // console.log('Place No: ', placeNo); // <--- test locally
    const executeTime = new Date(endTime.getTime() + (((48 * placeNo) - remainingHour) * 60 * 60 * 1000)); // execute when 24, 8, 1 hour before moving to next place 

    // find the existing scheduler
    let reminderScheduler = await SchedulerModel.findOne({ name: `${SchedulerType.REMINDER}-${remainingHour}hr-${creator.username}` });

    // save the generate checkout url scheduler
    if (!reminderScheduler) {
        reminderScheduler = await new SchedulerModel({ 
            name: `${SchedulerType.REMINDER}-${remainingHour}hr-${creator.username}`,
            runAt: executeTime, 
            type: SchedulerType.REMINDER, 
            bidAmount: bidAmount, 
            remainingHour: remainingHour, 
            deliveryFee: deliveryFee, 
            auction: auction?._id, 
            creator: creator?._id,
            bidder: winner?._id,
        }).save();
    }

    // send payment reminder mails
    SchedulerService.paymentReminder(reminderScheduler);

    // console.log(placeNo, 'scheduled REMINDER'); // test log
};

export const calculateDeliveryFee = (shipType: ShipType, destination: Destination) => {
    if (shipType === ShipType.WORLDWIDE || shipType === ShipType.COUNTRY) {
        return destination.deliveryFee;
    }
    return 0;
};

export const getOrdinalSuffix = (number: number) => {
    if (number % 10 === 1 && number % 100 !== 11) {
        return 'st';
    } else if (number % 10 === 2 && number % 100 !== 12) {
        return 'nd';
    } else if (number % 10 === 3 && number % 100 !== 13) {
        return 'rd';
    } else {
        return 'th';
    }
}