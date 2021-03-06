/**
*   TypeScript wrapper for Breeze ChMS API: http://breezechms.com/docs#extensions_api
*   The Breeze API allows churches to build custom functionality integrated with
*   Breeze.
*   Usage:
*     import * as breeze from './breeze';
*     let breeze_api = breeze.BreezeApi({request: ()})
*     let people = breeze_api.get_people();
*     for( let person in people) {
*       console.log(person['first_name'], person['last_name'])
*     }
*/

import * as breeze_fetch from './breeze-fetch'

interface person_id_params {
    person_id:number
}

interface get_person_details_params extends person_id_params {}

interface get_people_params {
    limit?:number,
    offset?:number,
    details?:boolean,
    filter_json?:{}
}

interface get_tags_params {
    folder_id?:string
}

interface optional_date_params {
    start_date?:string,
    end_date?:string
}

interface get_events_params extends optional_date_params {
    category_id?:number,
    eligible?:boolean,
    details?:boolean,
    limit?:number
}

interface get_event_params {
    instance_id:number,
    schedule?:boolean,
    schedule_direction?:string,
    schedule_limit?:number,
    eligible?:boolean,
    details?:boolean
}

interface event_check_in_params extends person_id_params {
    instance_id:number
}

interface event_check_out_params extends event_check_in_params {}

interface get_event_list_params {
    instance_id:number,
    details?:boolean,
    type?:string
}

interface get_event_eligible_params {
    instance_id:number
}

interface payment_id_params {
    payment_id:string
}

interface add_contribution_params {
    date?:string,
    name?:string,
    person_id?:number,
    uid?:number,
    processor?:string,
    method?:string,
    funds_json?:string,
    amount?:string,
    group?:string,
    batch_number?:number,
    batch_name?:string
}

interface edit_contribution_params extends add_contribution_params, payment_id_params {}

interface delete_contribution_params extends payment_id_params {}

interface list_contributions_params extends optional_date_params {
    person_id?:number,
    include_family?:boolean,
    amount_min?:number,
    amount_max?:number,
    method_ids?:string[],
    fund_ids?:string[],
    envelope_number?:number,
    batches?:string[],
    forms?:string[]
}

interface list_funds_params {
    include_totals?:boolean
}

interface list_pledges {
    campaign_id:number
}

const ENDPOINTS = {
    /* Breeze API url endpoints
    */ 
    PEOPLE : '/api/people',
    EVENTS : '/api/events',
    ATTENDANCE : '/api/events/attendance', // Check In from api docs
    PROFILE_FIELDS : '/api/profile',
    CONTRIBUTIONS : '/api/giving',
    FUNDS : '/api/funds',
    PLEDGES : '/api/pledges',
    TAGS : '/api/tags',
    VOLUNTEERS : '/api/volunteers',
    ACCOUNT : '/api/account',
    FORMS : '/api/forms'
};

/**
 * People
 */

const _people = (state) => ({
    get_people: ({limit, offset, details, filter_json}:get_people_params) => {
        /* List people from your database.
        Args:
          limit: Number of people to return. If None, will return all people.
          offset: Number of people to skip before beginning to return results.
                  Can be used in conjunction with limit for pagination.
          details: Option to return all information (slower) or just names.
        returns:
          JSON response. For example:
          {
            "id":"157857",
            "first_name":"Thomas",
            "last_name":"Anderson",
            "path":"img\/profiles\/generic\/blue.jpg"
          },
          {
            "id":"157859",
            "first_name":"Kate",
            "last_name":"Austen",
            "path":"img\/profiles\/upload\/2498d7f78s.jpg"
          },
          {
            ...
          }
        */

        const params:string[] = new Array()
        if( limit !== undefined ){
            params.push('limit='.concat(limit.toString()))
        }
        if( offset !== undefined ){
            params.push('offset='.concat(offset.toString()))
        }
        if( details !== undefined ){
            params.push('details='.concat(details.toString()))
        }
        if( filter_json !== undefined ){
            params.push('filter_json='.concat(JSON.stringify(filter_json)))
        }

        return state.request(ENDPOINTS.PEOPLE.concat('?', params.join('&')), {timeout: 10});
    },
    get_person_details: ({person_id}:get_person_details_params) => state.request(ENDPOINTS.PEOPLE.concat('/', person_id.toString())),
    get_profile_fields: () => state.request(ENDPOINTS.PROFILE_FIELDS)
})

// TODO: Add Person, Update Person, Delete Person
/*
* Tags
*/

const _tags = (state) => ({
    get_tags: ({folder_id}:get_tags_params) => {
        /* List people from your database.
        Args:
          folder_id: The Numeric ID of a folder.
        Returns:
          JSON response. For example:
          [
          {
              "id":"523928",
              "name":"4th & 5th",
              "created_on":"2017-09-10 09:19:40",
              "folder_id":"1539"
          },
          {
              "id":"51994",
              "name":"6th Grade",
              "created_on":"2017-02-06 06:40:40",
              "folder_id":"1539"
          },
           ...
          ]
        */
        const params:string[] = new Array()
        if( folder_id !== undefined ) {
            params.push('folder_id='.concat('folder_id'))
        }
        
        try {
            return state.request(ENDPOINTS.TAGS.concat('/list_tags?', params.join('&')));
        } catch(e) {
            return state.request(ENDPOINTS.TAGS.concat('/list_tags'));
        }
    },
    get_folders: () => state.request(ENDPOINTS.TAGS.concat('/list_folders'))
})

// TODO: Add Tag, Add Folder, Delete Tag, Delete Folder, Assign Tag, Unassign Tag
/*
* Events
*/

const _events = (state) => ({
    get_events: ({start_date, end_date, category_id, eligible, details, limit}:get_events_params) => {
        /* Retrieve all events for a given date range.
        Args:
          start_date: Start date; Events on or after (YYYY-MM-DD). defaults to first day of the current month.
          end_date: End date; Events on or before (YYYY-MM-DD). defaults to last day of the current month.
          category_id: If supplied, only events on the specified calendar will be returned.
          eligible: details about who is eligible to be checked in
          details: additional event details will be returned
          limit: Number of events to return. Default is 500. Max is 1000.
        Returns:
          JSON response.
        */
        const params:string[] = new Array()
        if( start_date !== undefined ) {
            params.push('start='.concat(start_date))
        }
        if( end_date !== undefined ) {
            params.push('end='.concat(end_date))
        }
        if( category_id !== undefined ) {
            params.push('category_id='.concat(category_id.toString()))
        }
        if( eligible !== undefined ) {
            params.push('eligible='.concat(eligible.toString()))
        }
        if( details !== undefined  && details === true) {
            params.push('details='.concat(details.toString()))
        }
        if( limit !== undefined ) {
            params.push('limit='.concat(limit.toString()))
        }

        try {
            return state.request(ENDPOINTS.EVENTS.concat('?', params.join('&')));
        } catch(e) {
            console.error(e)
            return state.request(ENDPOINTS.EVENTS);
        }
    },
    get_event: ({instance_id, schedule, schedule_direction, schedule_limit, eligible, details}:get_event_params) => {
        /* Retrieve all events for a given date range.
        Args:
          instance_id: The id of the event instance that should be returned.
          schedule: If other instances in the same series should be included.
          schedule_direction: If including the schedule, should it include events before the instance_id or after the instance_id
          schedule_limit: If including the schedule, how many events in the series should be returned. Default is 10. 
          eligible: details about who is eligible to be checked in.
          details: additional event details will be returned.
        Returns:
          JSON response.
        */
        const params:string[] = new Array()
        if( instance_id !== undefined ) {
            params.push('instance_id='.concat(instance_id.toString()))
        } else {
            throw new breeze_fetch.BreezeError('Listing an Event requires an instance_id.')
        }
        if( schedule !== undefined ) {
            params.push('schedule='.concat(schedule.toString()))
        }
        if( schedule_direction !== undefined ) {
            if( !schedule ) {
                throw new breeze_fetch.BreezeError('schedule_direction requires a schedule.')
            }
            switch( schedule_direction.trim() ) {
                case 'before':
                case 'after':
                    params.push('schedule_direction='.concat(schedule_direction))
                default:
                    console.log('schedule_direction', schedule_direction)
                    throw new breeze_fetch.BreezeError('schedule_direction can only be \'before\' or \'after\'.')
            }
        }
        if( schedule_limit !== undefined ) {
            if( !schedule ) {
                throw new breeze_fetch.BreezeError('schedule_limit requires a schedule.')
            }
            params.push('schedule_limit='.concat(schedule_limit.toString()))
        }
        if( eligible !== undefined ) {
            params.push('eligible='.concat(eligible.toString()))
        }
        if( details !== undefined ) {
            params.push('details='.concat(eligible.toString()))
        }

        return state.request(ENDPOINTS.EVENTS.concat('/list_event?', params.join('&')));
    },
    get_calendars: () => state.request(ENDPOINTS.EVENTS.concat('/calendars/list'))
})

// TODO: List Locations, Add Event, Delete Event

/*
* Check In
*/

const _check_in = (state) => ({
    event_check_in: ({person_id, instance_id}:event_check_in_params) => {
        /* Checks in a person into an event.
        Args:
          person_id: id for a person in Breeze database.
          instance_id: id for event instance to check into.
        Returns:
          True if check-in succeeds; False if check-in fails.
        */
        
        const params:string[] = new Array()
        if( person_id !== undefined ) {
            params.push('person_id='.concat(person_id.toString()))
        }
        if( instance_id !== undefined ) {
            params.push('instance_id='.concat(instance_id.toString()))
        }
        if( !person_id || !instance_id ) {
            throw new breeze_fetch.BreezeError('Adding attendance requires a person_id and instance_id.')
        }
        
        return state.request(ENDPOINTS.ATTENDANCE.concat('/add?', params.join('&')));
    },
    event_check_out: ({ person_id, instance_id}:event_check_out_params) => {
        /* Remove the attendance for a person checked into an event.
        Args:
          person_id: Breeze ID for a person in Breeze database.
          instance_id: id for event instance to check out (delete).
        Returns:
          True if check-out succeeds; False if check-out fails.
        */
        const params:string[] = new Array()
        if( person_id !== undefined ) {
            params.push('person_id='.concat(person_id.toString()))
        }
        if( instance_id !== undefined ) {
            params.push('instance_id='.concat(instance_id.toString()))
        }
        
        if( !person_id || !instance_id ) {
            throw new breeze_fetch.BreezeError('Deleting attendance requires a person_id and instance_id.')
        }

        return state.request(ENDPOINTS.ATTENDANCE.concat('/delete?', params.join('&')));
    },
    get_event_list: ({instance_id, details, type}:get_event_list_params) => {
        /* List the attendance checked into an event.
        Args:
          instance_id: id for event instance to list.
          details: If set to true, details of the person will be included in the response.
          type: Determines if result should contain people or anonymous head count by setting to either 'person' or 'anonymous'.
        Returns:
          JSON response.
        */
        const params:string[] = new Array()
        if( instance_id !== undefined ) {
            params.push('instance_id='.concat(instance_id.toString()))
        } else {
            throw new breeze_fetch.BreezeError('Listing attendance requires an instance_id.')
        }
        if( details !== undefined ) {
            params.push('details='.concat(details.toString()))
        }
        if( type !== undefined ) {
            switch( type.trim() ) {
                case 'person':
                case 'anonymous':
                    params.push('type='.concat(type))
                default:
                    throw new breeze_fetch.BreezeError('type can only be \'person\' or \'anonymous\'.')
            }
        }
        
        return state.request(ENDPOINTS.ATTENDANCE.concat('/delete?', params.join('&')));
    },
    get_event_eligible: ({instance_id}:get_event_eligible_params) => {
        /* List the eligible attendance to checked into an event.
        Args:
          instance_id: id for event instance to list.
        Returns:
          JSON response.
        */
        const params:string[] = new Array()
        if( instance_id !== undefined ) {
            params.push('instance_id='.concat(instance_id.toString()))
        } else {
            throw new breeze_fetch.BreezeError('Listing attendance requires an instance_id.')
        }
        
        return state.request(ENDPOINTS.ATTENDANCE.concat('/eligible?', params.join('&')));
    }
})

/*
* Contributions
*/

const _contributions = (state) => ({
    list_contributions: (
        {
        start_date,
        end_date,
        person_id,
        include_family,
        amount_min,
        amount_max,
        method_ids,
        fund_ids,
        envelope_number,
        batches,
        forms
        }:list_contributions_params) => {
        /* Retrieve a list of contributions.
        Args:
          start_date: Find contributions given on or after a specific date
                      (ie. 2015-1-1); required.
          end_date: Find contributions given on or before a specific date
                    (ie. 2018-1-31); required.
          person_id: ID of person's contributions to fetch. (ie. 9023482)
          include_family: Include family members of person_id (must provide
                          person_id); default: False.
          amount_min: Contribution amounts equal or greater than.
          amount_max: Contribution amounts equal or less than.
          method_ids: List of method IDs.
          fund_ids: List of fund IDs.
          envelope_number: Envelope number.
          batches: List of Batch numbers.
          forms: List of form IDs.
        Returns:
          List of matching contributions.
        Throws:
          breeze_fetch.BreezeError on malformed request.
        */
        const params:string[] = new Array()
        if( start_date !== undefined ) {
            params.push('start='.concat(start_date))
        }
        if( end_date !== undefined ) {
            params.push('end='.concat(end_date))
        }
        if( person_id !== undefined ) {
            params.push('person_id='.concat(person_id.toString()))
        }
        if( include_family !== undefined && include_family === true) {
            if( !person_id ) {
                throw new breeze_fetch.BreezeError('include_family requires a person_id.')
            }
            params.push('include_family='.concat(include_family.toString()))
        }
        if( amount_min !== undefined ) {
            params.push('amount_min='.concat(amount_min.toString()))
        }
        if( amount_max !== undefined ) {
            params.push('amount_max='.concat(amount_max.toString()))
        }
        if( method_ids !== undefined ) {
            params.push('method_ids='.concat(method_ids.join('-')))
        }
        if( fund_ids !== undefined ) {
            params.push('fund_ids='.concat(fund_ids.join('-')))
        }
        if( envelope_number !== undefined ) {
            params.push('envelope_number='.concat(envelope_number.toString()))
        }
        if( batches !== undefined ) {
            params.push('batches='.concat(batches.join('-')))
        }
        if( forms !== undefined ) {
            params.push('forms='.concat(forms.join("-")))
        }
        try {
            return state.request(ENDPOINTS.CONTRIBUTIONS.concat('/list?', params.join('&')));
        } catch(e) {
            return state.request(ENDPOINTS.CONTRIBUTIONS.concat('/list'));
        }
    },
    add_contribution: (
        {
        date,
        name,
        person_id,
        uid,
        processor,
        method,
        funds_json,
        amount,
        group,
        batch_number,
        batch_name
        }:add_contribution_params) => {
        /* Add a contribution to Breeze.
        Args:
          date: Date of transaction in DD-MM-YYYY format (ie. 24-5-2015)
          name: Name of person that made the transaction. Used to help match up
                contribution to correct profile within Breeze.  (ie. John Doe)
          person_id: The Breeze ID of the donor. If unknown, use UID instead of
                     person id  (ie. 1234567)
          uid: The unique id of the person sent from the giving platform. This
               should be used when the Breeze ID is unknown. Within Breeze a user
               will be able to associate state ID with a given Breeze ID.
               (ie. 9876543)
          processor: The name of the processor used to send the payment. Used in
                     conjunction with uid. Not needed if using Breeze ID.
                     (ie. SimpleGive, BluePay, Stripe)
          method: The payment method. (ie. Check, Cash, Credit/Debit Online,
                  Credit/Debit Offline, Donated Goods (FMV), Stocks (FMV),
                  Direct Deposit)
          funds_json: JSON string containing fund names and amounts. This allows
                      splitting fund giving. The ID is optional. If present, it must
                      match an existing fund ID and it will override the fund name.
                      ie. [ {
                              'id':'12345',
                              'name':'General Fund',
                              'amount':'100.00'
                            },
                            {
                              'name':'Missions Fund',
                              'amount':'150.00'
                            }
                          ]
          amount: Total amount given. Must match sum of amount in funds_json.
          group: This will create a new batch and enter all contributions with the
                 same group into the new batch. Previous groups will be remembered
                 and so they should be unique for every new batch. Use state if
                 wanting to import into the next batch number in a series.
          batch_number: The batch number to import contributions into. Use group
                        instead if you want to import into the next batch number.
          batch_name: The name of the batch. Can be used with batch number or group.
        Returns:
          Payment Id.
        Throws:
          breeze_fetch.BreezeError on failure to add contribution.
        */
        const params:string[] = new Array()
        if( date !== undefined ) {
            params.push('date='.concat('date'))
        }
        if( name !== undefined ) {
            params.push('name='.concat('name'))
        }
        if( person_id !== undefined ) {
            params.push('person_id='.concat('person_id'))
        }
        else if( uid !== undefined ) {            
            params.push('uid='.concat('uid'))
        }
        else {
            throw new breeze_fetch.BreezeError('Adding a contribution requires a person_id or uid.')
        }
        if( processor !== undefined ) {
            params.push('processor='.concat('processor'))
        }
        if( method !== undefined ) {
            params.push('method='.concat('method'))
        }
        if( funds_json !== undefined ) {
            params.push('funds_json='.concat('funds_json'))
        }
        if( amount !== undefined ) {
            params.push('amount='.concat('amount'))
        }
        if( group !== undefined ) {
            params.push('group='.concat('group'))
        }
        if( batch_number !== undefined ) {
            params.push('batch_number='.concat('batch_number'))
        }
        if( batch_name !== undefined ) {
            params.push('batch_name='.concat('batch_name'))
        }
        return state.request(ENDPOINTS.CONTRIBUTIONS.concat('/add?', params.join('&')))['payment_id'];
    },
    edit_contribution: (
        {
        payment_id,
        date,
        name,
        person_id,
        uid,
        processor,
        method,
        funds_json,
        amount,
        group,
        batch_number,
        batch_name
        }:edit_contribution_params) => {
        /* Edit an existing contribution.
        Args:
          payment_id: The ID of the payment that should be modified.
          date: Date of transaction in DD-MM-YYYY format (ie. 24-5-2015)
          name: Name of person that made the transaction. Used to help match up
                contribution to correct profile within Breeze.  (ie. John Doe)
          person_id: The Breeze ID of the donor. If unknown, use UID instead of
                     person id  (ie. 1234567)
          uid: The unique id of the person sent from the giving platform. This
               should be used when the Breeze ID is unknown. Within Breeze a user
               will be able to associate state ID with a given Breeze ID.
               (ie. 9876543)
          processor: The name of the processor used to send the payment. Used in
                     conjunction with uid. Not needed if using Breeze ID.
                     (ie. SimpleGive, BluePay, Stripe)
          method: The payment method. (ie. Check, Cash, Credit/Debit Online,
                  Credit/Debit Offline, Donated Goods (FMV), Stocks (FMV),
                  Direct Deposit)
          funds_json: JSON string containing fund names and amounts. This allows
                      splitting fund giving. The ID is optional. If present, it must
                      match an existing fund ID and it will override the fund name.
                      ie. [ {
                              'id':'12345',
                              'name':'General Fund',
                              'amount':'100.00'
                            },
                            {
                              'name':'Missions Fund',
                              'amount':'150.00'
                            }
                          ]
          amount: Total amount given. Must match sum of amount in funds_json.
          group: This will create a new batch and enter all contributions with the
                 same group into the new batch. Previous groups will be remembered
                 and so they should be unique for every new batch. Use state if
                 wanting to import into the next batch number in a series.
          batch_number: The batch number to import contributions into. Use group
                        instead if you want to import into the next batch number.
          batch_name: The name of the batch. Can be used with batch number or group.
        Returns:
          Payment id.
        Throws:
          breeze_fetch.BreezeError on failure to edit contribution.
        */
        const params:string[] = new Array()
        if( payment_id !== undefined ) {
            params.push('payment_id='.concat(payment_id))
        }
        if( date !== undefined ) {
            params.push('date='.concat(date))
        }
        if( name !== undefined ) {
            params.push('name='.concat(name))
        }
        if( person_id !== undefined ) {
            params.push('person_id='.concat(person_id.toString()))
        }
        if( uid !== undefined ) {
            params.push('uid='.concat(uid.toString()))
        }
        if( processor !== undefined ) {
            params.push('processor='.concat(processor))
        }
        if( method !== undefined ) {
            params.push('method='.concat(method))
        }
        if( funds_json !== undefined ) {
            params.push('funds_json='.concat(funds_json))
        }
        if( amount !== undefined ) {
            params.push('amount='.concat(amount))
        }
        if( group !== undefined ) {
            params.push('group='.concat(group))
        }
        if( batch_number !== undefined ) {
            params.push('batch_number='.concat(batch_number.toString()))
        }
        if( batch_name !== undefined ) {
            params.push('batch_name='.concat(batch_name))
        }
        
        return state.request(ENDPOINTS.CONTRIBUTIONS.concat('/edit?', params.join('&')))['payment_id'];
    },
    delete_contribution: ({payment_id}:delete_contribution_params) => {
        /* Delete an existing contribution.
        Args:
          payment_id: The ID of the payment that should be deleted.
        Returns:
          Payment id.
        Throws:
          breeze_fetch.BreezeError on failure to delete contribution.
        */
        const params:string[] = new Array()
        if( payment_id !== undefined ) {
            params.push('payment_id='.concat('payment_id'))
        } else {
            throw new breeze_fetch.BreezeError('Deleting a contribution requires a payment_id.')
        }
        
        return state.request(ENDPOINTS.CONTRIBUTIONS.concat('/delete?', params.join('&')))['payment_id'];    
    },
    list_funds: ({include_totals}:list_funds_params ) => {
        /* List all funds.
        Args:
          include_totals: Amount given to the fund should be returned.
        Returns:
          JSON Reponse.
        */
        const params:string[] = new Array()
        if( include_totals !== undefined && include_totals ) {
            params.push('include_totals='.concat(include_totals.toString()))
        }
        
        try {
            return state.request(ENDPOINTS.FUNDS.concat('/list?', params.join('&')));
        } catch(e) {
            return state.request(ENDPOINTS.FUNDS.concat('/list'));
        }
    }
})

// TODO: View Contributions
/*
* Pledges
*/

const _pledges = (state) => ({
    list_campaigns: () => state.request(ENDPOINTS.PLEDGES.concat('/list_campaigns')),
    list_pledges: ({campaign_id}:list_pledges) => {
        /* List of pledges within a campaign.
        Args:
          campaign_id: ID number of a campaign.
        Returns:
          JSON response.
        */
        const params:string[] = new Array()
        if( campaign_id !== undefined ) {
            params.push('campaign_id='.concat(campaign_id.toString()))
        } else {
            throw new breeze_fetch.BreezeError('Listing pledges within a campaign requires a campaign_id.')
        }
        
        return state.request(ENDPOINTS.PLEDGES.concat('/list_pledges?', params.join('&')));         
    }
})

/*
* Forms
*/
const _forms = (state) => ({

})
// TODO: List Forms, List Form Fields, List Form Entries


/*
* Volunteers
*/
const _volunteers = (state) => ({

})
// TODO: List Volunteers, Add Volunteer, Update Volunteer, Remove Volunteer, List Volunteer Roles, Add Volunteer Role, Remove Volunteer Role

/*
* Account
*/
const _account = (state) => ({

})
// TODO: Summary, List Account Log

/** 
 * A wrapper for the Breeze REST API.
 * Args:
       state: object containing a `request` function to perform call to breezeCHMS API.
 */
    
export const BreezeApi = (state) => {

    if( typeof state['request'] !== 'function' ) {
        throw new ReferenceError('request' + "() is not defined in state object passed in")
    }

    return Object.assign(
        {},
        _people(state),
        _tags(state),
        _events(state),
        _check_in(state),
        _contributions(state),
        _pledges(state),
        _forms(state),
        _volunteers(state),
        _account(state)
    )
}
