const ServiceResponseStatus = {
    Succeeded: 'Succeeded',
    Failed: 'Failed',
    Faulted: 'Faulted',
    Flawed: 'Flawed',
    Deleted: 'Deleted',
    Removed: 'Removed',
    Recovered: 'Recovered',
    Errored: 'Errored',

    AccessDenied: 'AccessDenied',
    NotAuthenticated: 'NotAuthenticated',
    NotAuthorized: 'NotAuthorized',
    Forbidden: 'Forbidden',
    NotAllowed: 'NotAllowed',
    NotPermitted: 'NotPermitted',
    NotPossible: 'NotPossible',

    NotFound: 'NotFound',
    AlreadyExists: 'AlreadyExists',
    NotValid: 'NotValid',
    NotProvided: 'NotProvided',
    NoData: 'NoData',
    InvalidData: 'InvalidData',
    IncorrectData: 'IncorrectData',
    InUse: 'InUse',
    
    ParentNotFound: 'ParentNotFound',
    ParentExists: 'ParentExists',
    ParentInvalid: 'ParentInvalid',
    ParentIncorrect: 'ParentIncorrect',
    ParentNotValid: 'ParentNotValid',
    ParentInUse: 'ParentInUse',
    ParentAccessDenied: 'ParentAccessDenied',
    
    ChildNotFound: 'ChildNotFound',
    ChildExists: 'ChildExists',
    ChildInvalid: 'ChildInvalid',
    ChildIncorrect: 'ChildIncorrect',
    ChildNotValid: 'ChildNotValid',
    ChildInUse: 'ChildInUse',
    ChildAccessDenied: 'ChildAccessDenied',

    MissingDependency: 'MissingDependency',
    InvalidDependency: 'InvalidDependency',
    IncorrectDependency: 'IncorrectDependency',
}

export default ServiceResponseStatus;